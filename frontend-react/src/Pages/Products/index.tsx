import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
} from "antd";
import axios from "../../libraries/axiosClient";
import React, { useCallback } from "react";

import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import numeral from "numeral";

const apiName = "/products";

export default function Products() {
  const [items, setItems] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [suppliers, setSupplier] = React.useState<any[]>([]);

  const [category, setCategory] = React.useState<any[]>();

  const [refresh, setRefresh] = React.useState<number>(0);
  const [open, setOpen] = React.useState<boolean>(false);
  const [openTable, setOpenTable] = React.useState<boolean>(true);
  const [updateId, setUpdateId] = React.useState<number>(0);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageSize(pageSize || 10);
  };

  const onSelectCategoryFilter = useCallback((e: any) => {
    setCategory(e.target.value);
  }, []);
  const callApi = useCallback((searchParams: any) => {
    axios
      .get(`${apiName}${`?${searchParams.toString()}`}`)
      .then((response) => {
        const { data } = response;
        setItems(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const onSearch = useCallback(() => {
    let filters: { category: any } = {
      category,
    };
    const searchParams: URLSearchParams = new URLSearchParams(filters);

    console.log(category);
    callApi(searchParams);
  }, [callApi, category]);

  const columns: ColumnsType<any> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: "1%",
      align: "right",
      render: (text, record, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Tên danh mục",
      dataIndex: "category.name",
      key: "category.name",
      render: (text, record, index) => {
        return <span>{record.category.name}</span>;
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier.name",
      key: "supplier.name",
      render: (text, record, index) => {
        return <span>{record.supplier.name}</span>;
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => {
        return <strong>{text}</strong>;
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: "1%",
      align: "right",
      render: (text, record, index) => {
        return <span>{numeral(text).format("0,0")}</span>;
      },
    },
    {
      title: "Giảm",
      dataIndex: "discount",
      key: "discount",
      width: "1%",
      align: "right",
      render: (text, record, index) => {
        return <span>{numeral(text).format("0,0")}%</span>;
      },
    },
    {
      title: () => {
        return <div style={{ whiteSpace: "nowrap" }}>Tồn kho</div>;
      },
      dataIndex: "stock",
      key: "stock",
      width: "1%",
      align: "right",
      render: (text, record, index) => {
        return <span>{numeral(text).format("0,0")}</span>;
      },
    },
    {
      title: "Mô tả / Ghi chú",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "1%",
      render: (text, record, index) => {
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setOpen(true);
                setUpdateId(record._id);
                updateForm.setFieldsValue(record);
              }}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                console.log(record._id);
                axios.delete(apiName + "/" + record._id).then((response) => {
                  setRefresh((f) => f + 1);
                  message.success("Xóa danh mục thành công!", 1.5);
                });
              }}
            />
          </Space>
        );
      },
    },
  ];

  // Get products
  React.useEffect(() => {
    axios
      .get(apiName)
      .then((response) => {
        const { data } = response;
        console.log(data.length);
        setItems(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [refresh]);

  // Get categories
  React.useEffect(() => {
    axios
      .get("/categories")
      .then((response) => {
        const { data } = response;
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Get suppliers
  React.useEffect(() => {
    axios
      .get("/suppliers")
      .then((response) => {
        const { data } = response;
        setSupplier(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const onFinish = (values: any) => {
    console.log(values);

    axios
      .post(apiName, values)
      .then((response) => {
        setRefresh((f) => f + 1);
        createForm.resetFields();
        message.success("Thêm mới danh mục thành công!", 1.5);
        setOpenTable(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onUpdateFinish = (values: any) => {
    console.log(values);
    console.log(updateId);

    axios
      .patch(apiName + "/" + updateId, values)
      .then((response) => {
        setRefresh((f) => f + 1);
        updateForm.resetFields();
        message.success("Cập nhật thành công!", 1.5);
        setOpen(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space>
        <Button onClick={onSearch}>
          Tìm kiếm
          <SearchOutlined />
        </Button>
        <select
          style={{ width: 150, borderRadius: "5px", height: 30 }}
          id="cars"
          onChange={onSelectCategoryFilter}
        >
          {categories.map((item: { _id: string; name: string }) => {
            return (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            );
          })}
        </select>
      </Space>

      <div style={{ paddingTop: "24px"}}>
        <h1 style={{ textAlign: "center" }}>Thêm danh mục</h1>
        {/* CREAT FORM */}
        <Form
          style={{ paddingTop: "24px", width:'80%' }}
          form={createForm}
          name="create-form"
          onFinish={onFinish}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
        >
          <Form.Item
            label="Danh mục sản phẩm"
            name="categoryId"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Danh mục sản phẩm bắt buộc phải chọn",
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              options={categories.map((c) => {
                return { value: c._id, label: c.name };
              })}
            />
          </Form.Item>

          <Form.Item
            label="Nhà cung cấp"
            name="supplierId"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Nhà cung cấp bắt buộc phải chọn",
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              options={suppliers.map((c) => {
                return { value: c._id, label: c.name };
              })}
            />
          </Form.Item>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Tên sản phẩm bắt buộc phải nhập",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá bán"
            name="price"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Giá bán bắt buộc phải nhập",
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Giảm giá" name="discount" hasFeedback>
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Tồn kho" name="stock" hasFeedback>
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Mô tả / Ghi chú" name="description" hasFeedback>
            <Input style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* TABLE */}
      <Modal
        width={1000}
        open={openTable}
        onCancel={() => {
          setOpenTable(false);
        }}
        onOk={() => {
          setOpenTable(false);
        }}
      >
        <Table
          rowKey="_id"
          dataSource={items.slice((currentPage - 1) * 10, currentPage * 10)}
          columns={columns}
          pagination={false}
        />
        <Pagination
          style={{ paddingTop: "24px" }}
          total={items.length}
          current={currentPage}
          pageSize={10}
          onChange={handlePageChange}
        />
      </Modal>

      {/* EDIT FORM */}
      <Modal
        open={open}
        title="Cập nhật danh mục"
        onCancel={() => {
          setOpen(false);
        }}
        cancelText="Đóng"
        okText="Lưu thông tin"
        onOk={() => {
          updateForm.submit();
        }}
      >
        <Form
          form={updateForm}
          name="update-form"
          onFinish={onUpdateFinish}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
        >
          <Form.Item
            label="Danh mục sản phẩm"
            name="categoryId"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Danh mục sản phẩm bắt buộc phải chọn",
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              options={categories.map((c) => {
                return { value: c._id, label: c.name };
              })}
            />
          </Form.Item>

          <Form.Item
            label="Nhà cung cấp"
            name="supplierId"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Nhà cung cấp bắt buộc phải chọn",
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              options={suppliers.map((c) => {
                return { value: c._id, label: c.name };
              })}
            />
          </Form.Item>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Tên sản phẩm bắt buộc phải nhập",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá bán"
            name="price"
            hasFeedback
            required={true}
            rules={[
              {
                required: true,
                message: "Giá bán bắt buộc phải nhập",
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Giảm giá" name="discount" hasFeedback>
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Tồn kho" name="stock" hasFeedback>
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Mô tả / Ghi chú" name="description" hasFeedback>
            <Input style={{ width: 200 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
